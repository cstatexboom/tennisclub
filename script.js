// Native interactions only: smooth anchor behavior, section reveal, and active nav state.
document.addEventListener("DOMContentLoaded", function () {
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section[id]"));
  var observed = Array.prototype.slice.call(document.querySelectorAll(".observe"));
  var parallaxItems = Array.prototype.slice.call(document.querySelectorAll(".parallax"));
  var ticking = false;

  function setActiveNav(sectionId) {
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + sectionId);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var targetId = link.getAttribute("href");
      var target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", targetId);
    });
  });

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  observed.forEach(function (section) {
    revealObserver.observe(section);
  });

  var navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActiveNav(entry.target.id);
        }
      });
    },
    {
      rootMargin: "-42% 0px -48% 0px",
      threshold: 0,
    }
  );

  sections.forEach(function (section) {
    navObserver.observe(section);
  });

  function updateParallax() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    parallaxItems.forEach(function (item) {
      var speed = Number(item.getAttribute("data-speed")) || 0.1;
      item.style.transform = "translate3d(0, " + scrollTop * speed + "px, 0)";
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateParallax();
});
